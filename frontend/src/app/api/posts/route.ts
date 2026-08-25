import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { moderateContent } from '@/lib/openai/moderation'
import { PostInsert } from '@/types/database.types'

/**
 * GET /api/posts
 * Fetches public timeline posts ordered by latest timestamp.
 * Supports optional mood filter: ?mood=เหนื่อยล้า
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moodFilter = searchParams.get('mood')

    const supabase = await createClient()

    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (moodFilter && moodFilter !== 'ทั้งหมด') {
      query = query.eq('mood_tag', moodFilter)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Failed to fetch posts from Supabase:', error)
      return NextResponse.json(
        { error: 'ไม่สามารถดึงข้อมูลโพสต์ได้ในขณะนี้' },
        { status: 500 }
      )
    }

    return NextResponse.json({ posts: posts || [] }, { status: 200 })
  } catch (error) {
    console.error('GET /api/posts unhandled error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/posts
 * AI Gate Enforcement & Post Creation.
 * All submissions must pass AI Moderation before being written to Supabase via Service Role.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, moodTag, userSessionId, authorAlias, authorAvatar } = body

    // 1. Basic Input Validation & Sanitization
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อความที่ต้องการระบาย' },
        { status: 400 }
      )
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'ข้อความมีความยาวเกินกำหนด (สูงสุด 1,000 ตัวอักษร)' },
        { status: 400 }
      )
    }

    if (!userSessionId || !authorAlias || !authorAvatar) {
      return NextResponse.json(
        { error: 'ข้อมูลระบุตัวตนไม่สมบูรณ์' },
        { status: 400 }
      )
    }

    const cleanContent = content.trim()
    const cleanMoodTag = (moodTag || 'ระบายความในใจ').trim()

    // 2. AI Moderation Gate
    const moderationResult = await moderateContent(cleanContent)
    const adminSupabase = createAdminClient()

    // 3. Handle Crisis Detection
    if (moderationResult.status === 'crisis') {
      // Log for safety auditing (Zero PII preserved)
      await adminSupabase.from('safety_audit_logs').insert({
        detected_category: 'CRISIS',
        severity_score: 1.0,
        is_blocked: true,
      })

      return NextResponse.json(
        {
          status: 'crisis',
          helpline: moderationResult.helpline || '1323',
          reason: moderationResult.reason || 'ตรวจพบสัญญาณความเสี่ยงต่อการทำร้ายตนเอง',
        },
        { status: 200 }
      )
    }

    // 4. Handle Toxic / Hate Speech Rejection
    if (moderationResult.status === 'toxic_rejected') {
      // Log for safety auditing
      await adminSupabase.from('safety_audit_logs').insert({
        detected_category: 'TOXIC',
        severity_score: 0.8,
        is_blocked: true,
      })

      return NextResponse.json(
        {
          status: 'toxic_rejected',
          suggestion: moderationResult.suggestion,
          reason: moderationResult.reason,
        },
        { status: 422 }
      )
    }

    // 5. Passed AI Gate -> Save Post via Privileged Service Role
    const newPostData: PostInsert = {
      content: cleanContent,
      mood_tag: cleanMoodTag,
      author_alias: authorAlias,
      author_avatar: authorAvatar,
      user_session_id: userSessionId,
      support_count: 0,
    }

    const { data: insertedPost, error: insertError } = await adminSupabase
      .from('posts')
      .insert(newPostData)
      .select()
      .single()

    if (insertError) {
      console.error('Failed to insert safe post to Supabase:', insertError)
      return NextResponse.json(
        { error: 'ไม่สามารถบันทึกโพสต์ได้ กรุณาลองใหม่อีกครั้ง' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        status: 'safe',
        post: insertedPost,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/posts unhandled error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการประมวลผลข้อความ' },
      { status: 500 }
    )
  }
}
