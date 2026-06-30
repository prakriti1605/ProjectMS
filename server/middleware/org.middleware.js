import Organisation from "../models/organisation.model.js";

export const checkOrganisationAccess = async (req, res, next) => {

    try {

        const organisation = await Organisation.findById(req.params.orgId);

        if (!organisation) {
            return res.status(404).json({
                message: "Organisation not found"
            });
        }
        console.log("Organisation found:", organisation._id);

        const member = organisation.members.find(member =>
            member.user.toString() === req.user._id.toString()
        );
        console.log("Member found:", member);

        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this organisation."
            });
        }

        req.org = organisation;
        req.member = member;
        console.log("Leaving checkOrganisationAccess");

        next();

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

};
//ye middleware ab auth ke baad use hoga. Pahle step mein check kiya ki user verified hai ya nhi. Agar hai, toh ab kya voh iss organisation ka member hai jismein voh kuch bhi karna  chahta hai? Aur aage ke middlewares ke liye hum kaam aur aasan bana rahe hai. Iss middleware mein store kar liya user ka org and user member jismein uska role aur permission hai. Ab isko hi aage forward kar denge. 
