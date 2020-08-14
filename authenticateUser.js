const auth = (req, res, next) => {
    if(req.session.account == null || req.session.account.role == "NONE") { 
        //res.send("Access Denied");
        return res.redirect("/login");
    }
    next();
}

module.exports = auth;