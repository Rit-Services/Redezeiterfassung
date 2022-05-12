import { Group } from "."

class GroupList{

    constructor(){
        this.groups = [
            new Group("LR",0).toMap(),
            new Group("SPD",0).toMap(),
            new Group("CDU",0).toMap(),
            new Group("Bündnis 90/Die Grünen",0).toMap(),
            new Group("FDP",0).toMap(),
            new Group("BE",0).toMap(),
            new Group("Ahrends",0).toMap(),
            new Group("Beekhuis",0).toMap(),
            new Group("Bothe",0).toMap(),
            new Group("Emden",0).toMap(),
            new Group("Guth",0).toMap(),
            new Group("Henze",0).toMap(),
            new Group("Lilienthal",0).toMap(),
            new Group("Rykena",0).toMap(),
            new Group("Wichmann",0).toMap(),
            new Group("Wirtz",0).toMap(),
        ]
    }

    getList(){
        return this.groups;
    }

    giveTimeOnPercentageSeats(duration,LR = 0.2,SPD=0.2,CDU =0.2,green=0.2,fdp=0.2){ //0.2 to divide time equally
        
        console.log("Groups we have are: ", this.groups)
        this.groups[0].duration = parseInt(LR * duration);
        this.groups[1].duration = parseInt(SPD * duration);
        this.groups[2].duration = parseInt(CDU * duration);
        this.groups[3].duration = parseInt(green * duration);
        this.groups[4].duration = parseInt(fdp * duration);
        console.log("Groups we have are: ", this.groups)
    }

}

export default GroupList