var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var lives = 5;
var livesText;  

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('halo', 'img/halo.png');
    this.load.image('ground', 'img/platform.png');
    this.load.image('star', 'img/star.png');
    this.load.image('bomb', 'img/bomb.png');
    this.load.spritesheet('dude', 'img/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
   
    this.add.image(400, 300, 'halo');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');


    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);


    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

 
    cursors = this.input.keyboard.createCursorKeys();

    
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bombs = this.physics.add.group();

   
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    livesText = this.add.text(16, 50, 'Lives: 5', { fontSize: '32px', fill: '#000' });

  
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
}

function collectStar (player, star)
{
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
}

function hitBomb (player, bomb)
{
    if (lives > 1) {
        lives--; 
        livesText.setText('Lives: ' + lives); 
        player.setTint(0xff0000); 
        this.physics.pause(); 
        player.anims.play('turn'); 

        
        this.time.delayedCall(1000, function () {
            this.physics.resume();
            player.clearTint(); 
        }, [], this);
    } else {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        livesText.setText('Lives: 0'); 
        gameOver = true;
    }
}

