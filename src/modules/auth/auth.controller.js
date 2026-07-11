import ApiResponse from "../../common/utils/api-response.js";
import * as authService from "./auth.service.js";

const register = async (req, res) => {
    const user = await authService.register(req.body);
    return ApiResponse.created(res, "Successfully Registered", user);
};

export { register };
