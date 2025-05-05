import { useState, useEffect } from 'react';

export default function usePasswordValidation(password) {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    let newErrors = [];
    if (password.length > 0) {
      if (password.length < 8) {
        newErrors.push('비밀번호는 8자 이상이어야 합니다.');
      }
      if (
        !password.match(/[0-9]/) || 
        !password.match(/[a-zA-Z]/) || 
        !password.match(/[^a-zA-Z0-9]/)
      ) {
        newErrors.push('비밀번호는 숫자, 영어, 특수문자가 반드시 포함되어야 합니다.');
      }
    }
    setErrors(newErrors);
  }, [password]);

  return {
    errors,
    isValid: errors.length === 0
  };
} 