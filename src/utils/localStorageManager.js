'use client';

/**
 * 데이터를 localStorage에 저장
 * @param {string} storageName - localStorage에 저장할 데이터의 이름
 * @param {any} data - 저장할 데이터
 */
const saveToStorage = (storageName, data) => {
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
 * @param {string} storageName - localStorage에서 불러올 데이터의 이름
 * @param {function} setData - 불러온 데이터를 설정할 함수
 */
const loadFromStorage = (storageName, setData) => {
    try {
        const raw = localStorage.getItem(storageName);
        if (!raw) return;

        const parsed = JSON.parse(raw);
        setData(parsed);
    } catch (err) {
        console.error('로드 중 오류 발생');
        throw err;
    }
};

/**
 * localStorage에서 특정 항목 삭제
 * @param {string} storageName - 삭제할 데이터의 이름
 */
const removeFromStorage = (storageName) => {
    try {
        localStorage.removeItem(storageName);
    } catch (err) {
        console.error('삭제 중 오류 발생');
        throw err;
    }
};

/**
 * localStorage 전체 초기화
 * @returns {void}
 */
const clearStorage = () => {
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