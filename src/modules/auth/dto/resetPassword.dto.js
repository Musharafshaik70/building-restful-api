import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto";

class resetPasswordDto extends BaseDto {
    static schema = Joi.object({
        password: Joi.string()
            .pattern(/(?=.*[A-Z])(?=.*\d)/)
            .message("Password must be 8 characters and at least one uppercase letter and one digit")
            .min(8)
            .required(),
    });
}

export default resetPasswordDto;
