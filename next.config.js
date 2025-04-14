/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NOTICE_DAYS: process.env.NOTICE_DAYS,
    QMSG_KEY: process.env.QMSG_KEY,
    QQ_NUMBER: process.env.QQ_NUMBER,
  },
}

module.exports = nextConfig 