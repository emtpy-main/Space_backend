
authRouter
- post  /signup
-post   /login
-post   /logout

profileRouter
-get /profile/view
-patch  /profile/edit
-patch  /profile/password

connectonRequestRouter
-post /request/send/interested/:userId
-post /request/send/ignore/:userId
-post /request/review/accepted/:requestId
-post /request/review/rejected/:requestId

userRouter
-get    /user/connection
-get   /user/request
-get    /user/feed  



status : ignore,    interested, accepted,   rejected,