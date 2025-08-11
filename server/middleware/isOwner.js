module.exports = (req, res, next) => {
  
  const tokenUserId = parseInt(req.user?.id);
  const paramUserId = parseInt(req.params.account_id);

  if (isNaN(paramUserId)) {
    return res.status(400).json({ error: 'Invalid user ID in route' });
  }

  if (tokenUserId !== paramUserId) {
    console.log(tokenUserId,paramUserId);
    
    return res.status(403).json({ error: 'Forbidden - You can only access and modify your own data' });
  }

  next();
};
