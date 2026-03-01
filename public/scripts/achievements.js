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
        

    
}