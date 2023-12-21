import AuthRoutePath from "./AuthRoutePath";
import Register from "./Register";
import EmailVerificationSent from "./EmailVerificationSent";
import EmailVerification from "./EmailVerification";
import ResendEmailVerification from "./ResendEmailVerification";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

const AuthRoute=[    
    {path:AuthRoutePath.LOGIN, component: Login},
    {path:AuthRoutePath.REGISTER, component: Register},
    {path:AuthRoutePath.EMAIL_VERIFICATION_SENT, component: EmailVerificationSent},
    {path:AuthRoutePath.VERIFY_EMAIL, component: EmailVerification},
    {path:AuthRoutePath.RESEND_EMAIL_VERIFICATION, component: ResendEmailVerification},
    {path:AuthRoutePath.FORGOT_PASSWORD, component: ForgotPassword},
    {path:AuthRoutePath.RESET_PASSWORD, component: ResetPassword},
]

export default AuthRoute;