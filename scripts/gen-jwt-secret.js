// gen-jwt-secret.js — 生成随机 JWT 签名密钥
// 用法: node gen-jwt-secret.js
// 输出: 64 位十六进制随机字符串

const crypto = require('crypto');
console.log(crypto.randomBytes(32).toString('hex'));
