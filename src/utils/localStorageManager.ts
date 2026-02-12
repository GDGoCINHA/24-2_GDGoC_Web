'use client';

/**
 * 데이터를 localStorage에 저장
 * @param storageName - localStorage에 저장할 데이터의 이름
 * @param data - 저장할 데이터
 */
const saveToStorage = (storageName: string, data: any): void => {
    try {
        const jsonData = JSON.stringify(data);
        localStorage.setItem(storageName, jsonData);
    } catch (err) {
        console.error('저장 중 오류 발생');
        throw err;
    }
};

/**
 * localStorage에서 데이터 불러오기
 * @param storageName - localStorage에서 불러올 데이터의 이름
 * @param setData - 불러온 데이터를 설정할 함수
 */
const loadFromStorage = <T>(storageName: string, setData: (data: T) => void): void => {
    try {
        const raw = localStorage.getItem(storageName);
        if (!raw) return;

        const parsed = JSON.parse(raw) as T;
        setData(parsed);
    } catch (err) {
        console.error('로드 중 오류 발생');
        throw err;
    }
};

/**
 * localStorage에서 특정 항목 삭제
 * @param storageName - 삭제할 데이터의 이름
 */
const removeFromStorage = (storageName: string): void => {
    try {
        localStorage.removeItem(storageName);
    } catch (err) {
        console.error('삭제 중 오류 발생');
        throw err;
    }
};

/**
 * localStorage 전체 초기화
 */
const clearStorage = (): void => {
    try {
        localStorage.clear();
    } catch (err) {
        console.error('전체 초기화 중 오류 발생');
        throw err;
    }
};

export {
    saveToStorage,
    loadFromStorage,
    removeFromStorage,
    clearStorage
};