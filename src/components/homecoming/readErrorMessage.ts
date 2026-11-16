/** 서버가 준 사유(ApiResponse.message)를 그대로 보여준다. 없으면 일반 문구. */
export const readErrorMessage = (error: unknown): string => {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message ?? '처리하지 못했습니다. 잠시 후 다시 시도해주세요.'
}
