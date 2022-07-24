const sendErrorDev = (err,res) =>{
    res.status(err.statusCode).json({
        status: err.status,
        error:  err, 
        errName : err.name,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd =  (err,res)  => { 
    if(err.isOperational){ 
        res.status(err.statusCode).json({
            errName : err.name,
            code:  err.code, 
            status: err.status,
            message: err.message.replace('', '')
        })
    }else{
          //Condition for not to leak the error
        console.error('ERROR', err)
        res.status(500).json({ //Generic message purpose
            status: 'error',
            message: 'Something went wrong please re-check your input, such as name, id etc'
        })
    }   
}

const handleCastErrorDB = err =>   new this.errorHandler( `Invalid ${err.path} : ${err.value}`,400)
const handleDuplicateFieldsDB = err => new this.errorHandler( `Duplicate ${err.keyValue.name} already exist`,400)
const handleJWTError = err => new this.errorHandler('Invalid token. Please login again', 401)
const handleJWTExpiredError = err => this.errorHandler('Session expired. Please login', 401)
const handleValidationErrorDB = err => {
    //console.log(err.errors)
    const errors = Object.values(err.errors).map(el => el.message)
    return new this.errorHandler(`Invalid data : ${errors.join('. ')}`,400)
}

exports.errorHandler = class appError extends Error {
    constructor(message, statusCode, res = null){
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        this.isOperational  = true
    }
}

exports.internalError = (err,req, res, next) => { 
    // console.log(process.env)
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'  
    err.isOperational = true
    err.message = err.message
    console.log(err.message)
    // if(process.env.NODE_ENV === 'DEVELOPMENT'){
    sendErrorDev(err,res)
    // }else if(process.env.NODE_ENV === 'PRODUCTION'){ //production
    //     if(err.name === 'CastError') err = handleCastErrorDB(err);
    //     if(err.code === 11000) err = handleDuplicateFieldsDB(err);
    //     if(err.name === 'ValidationError') err = handleValidationErrorDB(err)
    //     if(err.name === 'JsonWebTokenError') err = handleJWTError(err)
    //     if(err.name === 'TokenExpiredError') err = handleJWTExpiredError(err)
    //     sendErrorProd(err, res)
    // }
    next()
    
}
