import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto";

class resetPasswordDto extends BaseDto {
    static schema = Joi.object({
        password: Joi.string().message("Password must be 8 characters").min(8).required(),
    });
}

export default resetPasswordDto;
