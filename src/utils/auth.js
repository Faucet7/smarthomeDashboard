/**
 * auth.js - 认证相关工具函数
 * 提供对token和用户信息的统一管理
 */

// Token相关操作
const TokenKey = "token";

/**
 * 获取Token
 * @returns {string|null} 存储的token
 */
export function getToken() {
  return localStorage.getItem(TokenKey);
}

/**
 * 设置Token
 * @param {string} token 需要存储的token
 */
export function setToken(token) {
  return localStorage.setItem(TokenKey, token);
}

/**
 * 移除Token
 */
export function removeToken() {
  return localStorage.removeItem(TokenKey);
}

// 用户信息相关操作
const UserInfoKey = "userInfo";

/**
 * 获取用户信息
 * @returns {Object|null} 解析后的用户信息对象
 */
export function getUserInfo() {
  const userInfo = localStorage.getItem(UserInfoKey);
  return userInfo ? JSON.parse(userInfo) : null;
}

/**
 * 设置用户信息
 * @param {Object} userInfo 用户信息对象
 */
export function setUserInfo(userInfo) {
  return localStorage.setItem(UserInfoKey, JSON.stringify(userInfo));
}

/**
 * 移除用户信息
 */
export function removeUserInfo() {
  return localStorage.removeItem(UserInfoKey);
}

/**
 * 清除所有认证信息
 */
export function clearAuth() {
  removeToken();
  removeUserInfo();
}

/**
 * 检查是否已认证
 * @returns {boolean} 是否已认证
 */
export function isAuthenticated() {
  return !!getToken();
}
