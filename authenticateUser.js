const auth = (req, res, next) => {
    if(req.session.account == null || req.session.account.role == "NONE") { 
        //res.send("Access Denied");
        let userUrls = ["/actions", "/dashboard", "/settings", "/actions.html", "/dashboard.html", "/settings.html"];
        if(userUrls.includes(req.url)) {
            return res.redirect("login")
        } 

        return res.redirect("/");

    }
    next();
}

module.exports = auth;