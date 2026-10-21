const FREE_LIMIT = Number(process.env.FREE_LIMIT) || 50;

const isProActive = (dealer) =>
  dealer.plan === "pro" && !!dealer.planExpiresAt && dealer.planExpiresAt > new Date();

module.exports = { FREE_LIMIT, isProActive };
