/**
 * auth.js - 认证相关工具函数
 * 提供对token和用户信息的统一管理
 */

// Token相关操作
const TokenKey = "token";
const TokenExpireKey = "tokenExpire"; // 存储token过期时间

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
 * @param {number} expireIn token过期时间(秒)，默认2小时
 */
export function setToken(token, expireIn = 7200) {
  // 设置过期时间为当前时间 + expireIn秒
  const expireTime = new Date().getTime() + expireIn * 1000;
  localStorage.setItem(TokenExpireKey, expireTime.toString());
  return localStorage.setItem(TokenKey, token);
}

/**
 * 移除Token
 */
export function removeToken() {
  localStorage.removeItem(TokenExpireKey);
  return localStorage.removeItem(TokenKey);
}

/**
 * 检查token是否过期
 * @returns {boolean} 是否过期
 */
export function isTokenExpired() {
  const expireTime = localStorage.getItem(TokenExpireKey);
  if (!expireTime) return true;

  return new Date().getTime() > parseInt(expireTime, 10);
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
  const hasToken = !!getToken();
  if (!hasToken) return false;

  // 检查token是否过期
  if (isTokenExpired()) {
    // 如果过期了，清除认证信息
    clearAuth();
    return false;
  }

  return true;
}
