export class JobError extends Error {
    constructor(message: string) {
        super(message);
<<<<<<< HEAD
        this.name = this.constructor.name;
=======
        this.name = 'JobError';
>>>>>>> e30afaeaa8be549bbae9b62e32153ca2ade16709
        Error.captureStackTrace(this, this.constructor);
    }
}