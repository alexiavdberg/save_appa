let config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
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
let countDown = 10;
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
    backImage.setScale(0.5);
    backImage.setOrigin(0, 0);

    //Prepare play button
    playImage = this.add.image(config.width / 2, config.height / 2 + 180, 'play').setInteractive();
    playImage.setScale(0.15);
    playImage.on('pointerdown', () => {
        gameState = 'GameScreen';
        console.log('gamescreen');
    })

    //Prepare start text
    playText = this.add.text(config.width / 2, config.height / 2 - 80, 'Sauve Appa de la tempete autant\n\nde fois que possible en 1 minute', { fontFamily: 'snow', fontSize: 36, color: '#41c5b8', align: 'center' });
    playText.setOrigin(0.5, 0.5);

    //Show score
    scoreText = this.add.text(config.width - 10, 15, 'Score : ' + score, { fontFamily: 'snow', fontSize: 24, color: '#41c5b8' });
    scoreText.setOrigin(1, 0);
    scoreText.setVisible(false);

    //Prepare final score
    finalScoreText = this.add.text(config.width / 2, config.height / 2 + 155, 'Tu m\'as sauve ' + score + ' fois', { fontFamily: 'snow', fontSize: 42, color: '#41c5b8', align: 'center' });
    finalScoreText.setOrigin(0.5, 0.5);
    finalScoreText.setVisible(false);

    //Creating and showing timer
    countDownText = this.add.text(config.width - 10, 50, 'Time : ' + countDown, { fontFamily: 'snow', fontSize: 24, color: '#41c5b8' });
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

    //Prepare snowflakes group
    snowflakes = this.physics.add.group({
        key: ['snowflake1', 'snowflake2', 'snowflake3', 'snowflake4'],
        frame: [0, 1, 2, 3],
        quantity: 50,
        bounceX: 1,
        bounceY: 1,
        collideWorldBounds: true
    });
    snowflakes.setVisible(false);

    //Create appas group
    appas = this.physics.add.group({
        key: 'appa',
        quantity: 1,
        bounceX: 1,
        bounceY: 1,
        collideWorldBounds: true
    });
    appas.setVisible(false);

    //Prepare win text
    textWin = this.add.text(config.width / 2, config.height / 2 + 180, 'Score : +1\n\nClique sur l\'ecran pour continuer\n avant que le temps ne soit ecoule', { fontFamily: 'snow', fontSize: 24, color: '#85e6ff', align: 'center' });
    textWin.setOrigin(0.5, 0.5);
    textWin.setVisible(false);

    //Prepare Appa win image
    appaWin = this.add.image(config.width / 2, config.height / 2 - 60, 'appaWin');
    appaWin.setScale(0.3);
    appaWin.setVisible(false);

    // Prepare replay sprite
    appaReplay = this.add.image(config.width / 2, config.height / 2 - 60, 'appaReplay');
    appaReplay.setScale(0.40);
    appaReplay.setVisible(false);

    //Prepare replay image and make it clickable 
    replayImage = this.add.image(config.width / 2, config.height / 2 + 220, 'replay').setInteractive();
    replayImage.setScale(0.25);
    replayImage.setVisible(false);
    replayImage.on('pointerdown', () => {
        this.scene.restart();
        gameState = 'StartScreen';
        console.log('startscreen');
    });

    //Show and make appas move
    Phaser.Actions.RandomRectangle(appas.getChildren(), this.physics.world.bounds);
    appas.setVisible(false);
    for (appa of appas.getChildren()) {
        Phaser.Math.RandomXY(appa.body.velocity, 100);
        appa.setInteractive();
        appa.on('pointerdown', () => {
            textWin.setVisible(true);
            appaReplay.setVisible(true);

            // Clear elements from the screen
            backImage.setVisible(false);
            scoreText.setVisible(false);
            countDownText.setVisible(false);
            replayImage.setVisible(false);

            // Delete appas and snowflakes if they exist
            if (snowflakes) {
                snowflakes.clear(true, true);
            }
            if (appas) {
                appas.clear(true, true);
            }
            this.input.on('pointerdown', () => {
                gameState = 'ContinueScreen';
                console.log('continuescreen');
                score++;
            });
        });
    }

    //Show and make snowflakes move
    snowflakes.setVisible(false);
    Phaser.Actions.RandomRectangle(snowflakes.getChildren(), this.physics.world.bounds);

    for (snowflake of snowflakes.getChildren()) {
        Phaser.Math.RandomXY(snowflake.body.velocity, 100);
    }
}

function update() {
    if (gameState === 'StartScreen') 
    {
        countDown = 10;
        score = 0;

        playImage.setVisible(true);
        playText.setVisible(true);
        backImage.setVisible(true);

        textWin.setVisible(false);
        appaWin.setVisible(false);
        replayImage.setVisible(false);
        scoreText.setVisible(false);
        countDownText.setVisible(false);

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
        replayImage.setVisible(false);
        appaReplay.setVisible(false);
        
        gameState = 'ContinueScreen';
    }

    if (gameState === 'ContinueScreen')
    {
        replayImage.setVisible(true);
        appaReplay.setVisible(true);
        
        // Delete appas and snowflakes if they exist
        if (snowflakes) {
            snowflakes.clear(true, true);
        }
        if (appas) {
            appas.clear(true, true);
        }

        this.input.on('pointerdown', () => {
            gameState = 'GameScreen';
            console.log('gamescreen');
        });
    }

    if (gameState === 'EndGameScreen') 
    {
        appaWin.setVisible(true);
        finalScoreText.setVisible(true);
        backImage.setVisible(true);
        replayImage.setVisible(true);

        // Clear elements from the screen
        appaReplay.setVisible(false);
        textWin.setVisible(false);
        scoreText.setVisible(false);
        countDownText.setVisible(false);

        // Delete appas and snowflakes if they exist
        if (snowflakes) {
            snowflakes.clear(true, true);
        }
        if (appas) {
            appas.clear(true, true);
        }
    }
}