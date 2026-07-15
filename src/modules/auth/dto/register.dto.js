import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto";

class RegisterDto extends BaseDto {
    static schema = Joi.object({
        name: Joi.string().trim().min(3).max(25).required(),
        email: Joi.string().email().lowercase().required(),
        password: Joi.string()
            .pattern(/(?=.*[A-Z])(?=.*\d)/)
            .message("Password must be 8 characters")
            .min(8)
            .required(),
        role: Joi.string().valid("customer", "seller").default("customer"),
    });
}

export default RegisterDto;
