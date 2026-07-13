import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto";

class LoginDto extends BaseDto {
    static schema = Joi.object({
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().message("Password must be 8 characters").min(8).required(),
    });
}

export default LoginDto;
