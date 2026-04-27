exports.sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

exports.sendError = (res, message = 'Error', statusCode = 500) => {
  res.status(statusCode).json({
    status: 'error',
    message,
    data: null
  });
};
