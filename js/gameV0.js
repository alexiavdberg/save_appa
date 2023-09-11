let config = {
    type: Phaser.AUTO,
    width: 1344,
    height: 756,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload : preload,     
        create: create,     
        update : update   
    }
};

function loadFont(name, url) {
    var newFont = new FontFace(name, `url(${url})`);
    newFont.load().then(function (loaded) {
        document.fonts.add(loaded);
    }).catch(function (error) {
        return error;
    });
}

let game = new Phaser.Game(config);
let score = 0;
let countDown = 60;
let gameState;

function init() {
    gameState = 'startScreen';
}

function preload() {
    loadFont('snow', './assets/fonts/Snow.ttf');

    this.load.image('background', './assets/images/landscape.png');
    this.load.image('play', './assets/images/start.png');
    this.load.image('appa', './assets/images/appa.png');
    this.load.image('appaReplay', './assets/images/appaReplay.png');
    this.load.image('appaWin', './assets/images/appaWin.png');
    this.load.image('replay', './assets/images/replay.png');

    this.load.spritesheet('snowflake1', './assets/images/snowflake1.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('snowflake2', './assets/images/snowflake2.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('snowflake3', './assets/images/snowflake3.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('snowflake4', './assets/images/snowflake4.png', { frameWidth: 20, frameHeight: 20 });
}

function create() {
    //Show background image
    backImage = this.add.image(0, 0, 'background');
    backImage.setScale(0.7);
    backImage.setOrigin(0, 0);

    //Prepare play button
    playImage = this.add.image(config.width/2, config.height/2+180, 'play').setInteractive();
    playImage.setScale(0.2);
    playImage.on('pointerdown', () => {
        gameState = 'GameScreen';
    })
    
    //Prepare start text
    playText = this.add.text(config.width/2, config.height/2-100, 'Sauve Appa de la tempete autant\n\nde foisque possible en 1 minute', { fontFamily : 'snow', fontSize: 48, color : '#41c5b8', align: 'center' });
    playText.setOrigin(0.5, 0.5);

    //Show score
    scoreText = this.add.text(1320, 15, 'Score : ' + score,  { fontFamily : 'snow', fontSize: 24, color : '#41c5b8' });
    scoreText.setOrigin(1, 0);
    scoreText.setVisible(false);
    
    //Prepare final score
    finalScoreText = this.add.text(config.width/2, config.height/2+250, 'Tu m\'as sauve ' + score + ' fois',  { fontFamily : 'snow', fontSize: 48, color : '#41c5b8', align: 'center' });
    finalScoreText.setOrigin(0.5, 0.5);
    finalScoreText.setVisible(false);

    //Creating and showing timer
    countDownText = this.add.text(1320, 50, 'Time : ' + countDown, { fontFamily : 'snow', fontSize : 24, color : '#41c5b8' });
    countDownText.setOrigin(1, 0);
    let countDownTimer = this.time.addEvent({
        delay: 1000, // = 1 second
        callback: () => {
            countDown--;
            countDownText.text = 'Time : ' + countDown;
            if (countDown == 0) {
                gameState = 'EndGameScreen';
            }
        },
        repeat: countDown - 1
    })
    countDownText.setVisible(false);

    //Show and make snowflakes move
    snowflakes = this.physics.add.group({
        key: ['snowflake1', 'snowflake2', 'snowflake3', 'snowflake4'],
        frame: [ 0, 1, 2, 3 ],
        quantity: 50,
        bounceX: 1,
        bounceY: 1,
        collideWorldBounds: true
    });
    snowflakes.setVisible(false);

    Phaser.Actions.RandomRectangle(snowflakes.getChildren(), this.physics.world.bounds);

    for (snowflake of snowflakes.getChildren())
    {
        Phaser.Math.RandomXY(snowflake.body.velocity, 100);
    }

    //Show and make Appa move
    appas = this.physics.add.group({
        key: 'appa',
        quantity: 1,
        bounceX: 1,
        bounceY: 1,
        collideWorldBounds: true
    });
    appas.setVisible(false);

    Phaser.Actions.RandomRectangle(appas.getChildren(), this.physics.world.bounds);

    for (appa of appas.getChildren())
    {
        Phaser.Math.RandomXY(appa.body.velocity, 100);
        appa.setInteractive();
        appa.on('pointerdown', () =>{
            textWin.setVisible(true);
            appaReplay.setVisible(true);
            replayImage.setVisible(true);
        
            // Effacez tous les éléments de l'écran
            backImage.setVisible(false);
            scoreText.setVisible(false);
            countDownText.setVisible(false);
        
            // Supprimez les groupes de snowflakes et appas s'ils existent
            if (snowflakes) {
                snowflakes.clear(true, true);
            }
            if (appas) {
                appas.clear(true, true);
            }
        });
    }

    //Prepare win text
    textWin = this.add.text(config.width/2, config.height/2+200, 'Merci de m\'avoir sauve !\n Clique sur "Replay" pour continuer\n avant que le temps ne soit ecoule', { fontFamily : 'snow', fontSize: 28, color : '#85e6ff', align: 'center' });
    textWin.setOrigin(0.5, 0.5);
    textWin.setVisible(false);

    //Prepare Appa win image
    appaWin = this.add.image(config.width/2, config.height/2-90, 'appaWin');
    appaWin.setScale(0.45);
    appaWin.setVisible(false);

    //Prepare replay image, make it clickable and add to score
    replayImage = this.add.image(config.width/2, config.height/2+300,'replay').setInteractive();
    replayImage.setScale(0.2);
    replayImage.setVisible(false);
    replayImage.on('pointerdown', () => {
        this.scene.restart();
        score++;
    });

    appaReplay = this.add.image(config.width/2, config.height/2-100, 'appaReplay');
    appaReplay.setScale(0.55);
    appaReplay.setVisible(false);
}

function update() {
    if (gameState === 'StartScreen') 
    {
        playImage.setVisible(true);
        playText.setVisible(true);
        backImage.setVisible(true);
        
        textWin.setVisible(false);
        appaWin.setVisible(false);
        replayImage.setVisible(false);
        scoreText.setVisible(false);
        countDownText.setVisible(false);
    
        // Supprimez les groupes de snowflakes et appas s'ils existent
        if (snowflakes) {
            snowflakes.clear(true, true);
        }
        if (appas) {
            appas.clear(true, true);
        }

        gameState = 'GameScreen';
    }

    if (gameState === 'GameScreen')
    {
        backImage.setVisible(true);
        scoreText.setVisible(true);
        countDownText.setVisible(true);
        snowflakes.setVisible(true);
        appas.setVisible(true);

        playImage.setVisible(false);
        playText.setVisible(false);
    }

    if (gameState === 'EndGameScreen')
    {
        appaWin.setVisible(true);
        finalScoreText.setVisible(true);
        backImage.setVisible(true);
        
        // Effacez tous les éléments de l'écran
        appaReplay.setVisible(false);
        textWin.setVisible(false);
        scoreText.setVisible(false);
        countDownText.setVisible(false);
        replayImage.setVisible(false);
    
        // Supprimez les groupes de snowflakes et appas s'ils existent
        if (snowflakes) {
            snowflakes.clear(true, true);
        }
        if (appas) {
            appas.clear(true, true);
        }
    }
}