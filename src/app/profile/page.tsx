'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

import ApplicationDetailModal from '@/components/profile/ApplicationDetailModal'
import ApplicationStatus from '@/components/profile/ApplicationStatus'
import ProfileCard from '@/components/profile/ProfileCard'
import ProfileInfoSection from '@/components/profile/ProfileInfoSection'
import Loader from '@/components/ui/common/Loader'
import { useAuth } from '@/hooks/useAuth'
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi'
import {
  fetchMyCoreApplication,
  fetchMyCoreApplicationDetail,
  fetchMyMemberApplication,
  fetchMyProfile,
  updateMyProfile,
  updateMyProfileImage
} from '@/services/profile/profileClient'
import type {
  MyCoreApplication,
  MyCoreApplicationDetail,
  MyMemberApplication,
  UpdateProfilePayload,
  UserProfile
} from '@/types/profile'

export default function ProfilePage() {
  const { apiClient } = useAuthenticatedApi()
  const { user, setUser } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [application, setApplication] = useState<MyCoreApplication | null>(null)
  const [memberApplication, setMemberApplication] = useState<MyMemberApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [applicationLoading, setApplicationLoading] = useState(true)
  const [applicationError, setApplicationError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [openedApplication, setOpenedApplication] = useState<'core' | 'member' | null>(null)
  const [coreDetail, setCoreDetail] = useState<MyCoreApplicationDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true

    const load = async () => {
      try {
        const data = await fetchMyProfile(apiClient)
        if (alive) setProfile(data)
      } catch {
        if (alive) setLoadError('내 정보를 불러오지 못했습니다.')
      } finally {
        if (alive) setLoading(false)
      }
    }

    const loadApplications = async () => {
      try {
        const [core, member] = await Promise.all([
          fetchMyCoreApplication(apiClient),
          fetchMyMemberApplication(apiClient)
        ])
        if (alive) {
          setApplication(core)
          setMemberApplication(member)
        }
      } catch {
        // 404(미지원)는 클라이언트가 이미 null로 돌려준다. 여기 오는 건 실제 실패다.
        if (alive) setApplicationError('지원 현황을 불러오지 못했습니다.')
      } finally {
        if (alive) setApplicationLoading(false)
      }
    }

    void load()
    void loadApplications()

    return () => {
      alive = false
    }
  }, [apiClient])

  // AuthUser의 필드가 전부 optional이라 `{...user, name, image}`로 덮으면
  // 저장된 user가 비어 있을 때 userRole·id·team이 사라진다. ApiCodeGuard는
  // API 호출로 권한을 확인하므로, 토큰은 유효한데 localStorage user만 빈
  // 상태가 실제로 가능하다. UserProfile이 AuthUser의 7개 필드를 모두 담고
  // 있으니 응답으로 전체를 다시 채운다.
  const syncAuthUser = useCallback(
    (source: UserProfile) => {
      setUser({
        ...user,
        id: source.id,
        name: source.name,
        email: source.email,
        userRole: source.userRole,
        team: source.team,
        membershipStatus: source.membershipStatus,
        image: source.image
      })
    },
    [setUser, user]
  )

  const handleSave = useCallback(
    async (payload: UpdateProfilePayload) => {
      setSaving(true)
      setSaveError(null)
      try {
        const updated = await updateMyProfile(apiClient, payload)
        setProfile(updated)
        syncAuthUser(updated)
      } catch (error) {
        setSaveError('수정에 실패했습니다. 입력값을 확인해 주세요.')
        throw error
      } finally {
        setSaving(false)
      }
    },
    [apiClient, syncAuthUser]
  )

  const handleImageChange = useCallback(
    async (file: File) => {
      setUploading(true)
      setImageError(null)
      try {
        const image = await updateMyProfileImage(apiClient, file)
        if (profile) {
          const next: UserProfile = { ...profile, image }
          setProfile(next)
          syncAuthUser(next)
        }
      } catch {
        setImageError('이미지 변경에 실패했습니다. png·jpg·webp 5MB 이하만 가능합니다.')
      } finally {
        setUploading(false)
      }
    },
    [apiClient, profile, syncAuthUser]
  )

  // 목록 응답에는 문항 답변이 없어 상세를 따로 받는다. 한 번 받은 뒤에는 다시 부르지 않는다.
  const openCoreDetail = useCallback(async () => {
    if (!application) return
    setDetailError(null)
    setOpenedApplication('core')
    if (coreDetail) return

    setDetailLoading(true)
    try {
      const detail = await fetchMyCoreApplicationDetail(apiClient, application.applicationId)
      setCoreDetail(detail)
    } catch {
      setDetailError('지원서를 불러오지 못했습니다.')
    } finally {
      setDetailLoading(false)
    }
  }, [apiClient, application, coreDetail])

  // 부원 지원서는 목록 응답이 곧 상세다. 추가 호출이 필요 없다.
  const openMemberDetail = useCallback(() => {
    setDetailError(null)
    setOpenedApplication('member')
  }, [])

  const closeDetail = useCallback(() => setOpenedApplication(null), [])

  if (loading) return <Loader isLoading />
  if (loadError) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white pc:px-10">
        <div className="mx-auto w-full max-w-[880px] space-y-10">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-1 typo-pc-b3 text-gray-800 transition hover:text-white mobile:typo-m-b3"
            >
              <span aria-hidden>←</span>
              메인으로
            </Link>
            <p className="typo-pc-c1 text-red">{loadError}</p>
          </div>
        </div>
      </main>
    )
  }
  if (!profile) return null

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white pc:px-10">
      <div className="mx-auto w-full max-w-[880px] space-y-10">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-1 typo-pc-b3 text-gray-800 transition hover:text-white mobile:typo-m-b3"
          >
            <span aria-hidden>←</span>
            메인으로
          </Link>
          <h1 className="typo-h3 mobile:typo-m-h2">내 정보 페이지</h1>
        </div>

        <div className="space-y-4">
          <h2 className="typo-pc-h4 text-white">사용자 프로필</h2>
          <ProfileCard
            profile={profile}
            onImageChange={handleImageChange}
            uploading={uploading}
            imageError={imageError}
          />
        </div>

        <ProfileInfoSection
          profile={profile}
          onSave={handleSave}
          saving={saving}
          error={saveError}
        />

        <ApplicationStatus
          application={application}
          memberApplication={memberApplication}
          loading={applicationLoading}
          error={applicationError}
          onOpenCore={() => void openCoreDetail()}
          onOpenMember={openMemberDetail}
        />
      </div>

      {openedApplication !== null ? (
        <ApplicationDetailModal
          title={openedApplication === 'core' ? '운영진 지원서' : '부원 지원서'}
          core={openedApplication === 'core' ? coreDetail : null}
          member={openedApplication === 'member' ? memberApplication : null}
          loading={detailLoading}
          error={detailError}
          onClose={closeDetail}
        />
      ) : null}
    </main>
  )
}
