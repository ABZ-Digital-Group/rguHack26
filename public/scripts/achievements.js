import transportLogs from "./journeyInput.js";

class Achievement {
    constructor(id, achievementName, description, goal){
        this.id = id;
        this.achievementName = achievementName;
        this.description = description;
        this.goal = goal;
        this.progress = 0;
        this.unlocked = false;
    }

    addProgress(amount){
        if(this.unlocked) return;

        this.progress += amount;

        if(this.progress >= this.goal){
            this.progress = this.goal;
            this.unlocked();
        }
    }

    unlock(){
        this.unlocked = true;
        console.log(`Achievement Unlocked! : ${this.achievementName}`)
    }
    
    
    getStatus(){
        return{
            id: this.id,
            achievementName: this.achievementName,
            description: this.description,
            progress: this.progress,
            goal: this.goal,
            unlocked: this.unlocked
        };
    }
}

// 1000 calories achievement
const burn1000Cal = new Achievement(
    "1000calories",
    "1000 Calories Burned",
    "Burn a total of 1000 calories",
    1000
);



const fiveJourneysLogged = new Achievement(
    "log_5_journeys",
    "5 Journeys Logged",
    "Log a total of 5 journeys",
    5
);


export{
    burn1000Cal,
    fiveJourneysLogged
};