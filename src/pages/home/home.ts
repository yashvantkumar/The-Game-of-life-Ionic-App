import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SocketProvider } from '../../providers/socket/socket';
import { ActionSheetController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  name: String;
  unique_id;
  createGameBox = false;
  Game: any;
  AllPlayers: any;
  bonusCardsEvent = 'share';
  notification;
  
  constructor(
    public navCtrl: NavController,
    private _socket: SocketProvider,
    public actionSheetCtrl: ActionSheetController
  ) {
    if(localStorage.getItem('room')){
      this.Game = JSON.parse(localStorage.getItem('room'))
    } else {
      this.createGameBox = true;
    }
  }

  ngOnInit() {
    
    if(this.Game && this.Game._id) {
      this._socket.emit('join player', {_id: this.Game._id});
      console.log(this.Game._id)
      // this._socket.emit('get players', {game_id: this.Game.game_id});
      this._socket.listen('room rejoined').subscribe((data) => {
        this.Game = data;
        localStorage.setItem('room', JSON.stringify(this.Game));
        this.createGameBox = false;
      });
      this._socket.listen('No player found').subscribe((data) => {
        this.Game = undefined;
        localStorage.removeItem('room')
        this.createGameBox = true;
      });
     
    }

    this.getMyData();
    this.joinedPlayers();

    this._socket.listen('revenge taken').subscribe((data) => {
      console.log(data);
      this.getMyData();
    });

  }

  joinGame() {
    let data = {
      name: this.name,
      unique_id: this.unique_id
    }

    this._socket.emit('join game', data);
    this._socket.listen('room joined').subscribe((data) => {
      this.Game = data;
      this._socket.localNotification('Game Joined')
      localStorage.setItem('room', JSON.stringify(this.Game));
      this.createGameBox = false;
    });
  }

  getMyData(){
    this._socket.emit('get my data', {_id: this.Game._id});
    this._socket.listen('my data').subscribe((data) => {
      localStorage.setItem('room', JSON.stringify(data));
      this.Game = data;
    });
  }
  
  openMenu(event) {
    if(event == 'share'){
      this.bonusCardsEvent = 'share'
    } else {
      this.bonusCardsEvent = 'exemption'
    }
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Player',
      cssClass: 'action-sheets-basic-page'
    });

    for(let i=0; i<this.AllPlayers.length; i++) {

      var button = {
        text: this.AllPlayers[i].name,
        handler: () => {
          this.shareExemptCard(this.AllPlayers[i])
        }
      }
      actionSheet.addButton(button);
    }
    actionSheet.present();
  };

  shareExemptCard(user) {
    let data = {
      to: user._id,
      from: this.Game._id,
      event: this.bonusCardsEvent
    }
    if(data.to != data.from) {
      this._socket.emit('bonus card', data);    
    } else {

    }
    this.getMyData();
  }

  joinedPlayers() { 
    this._socket.listen('players').subscribe((data) => {
      this.AllPlayers = data;
    });
    this._socket.emit('get players', {game_id: this.Game.game_id});
  }
  
  playerJoined() {
    this._socket.listen('player joined').subscribe(data => {
      this._socket.localNotification(data.name+' has joined the game');
    });
  }

  openRevenge() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Player',
      cssClass: 'action-sheets-basic-page'
    });
    for(let i=0; i<this.AllPlayers.length; i++) {
      var button = {
        text: this.AllPlayers[i].name,
        handler: () => {
          this.revengeOnPlayer(this.AllPlayers[i])
        }
      }
      actionSheet.addButton(button);   
    }
    actionSheet.present();
  }

  revengeOnPlayer(user) {
    let data = {
      to: user._id,
      from: this.Game._id
    }
    console.log(data);
    if(data.to != data.from) {
      this._socket.emit('revenge', data);
    } else {

    }
    this.getMyData();
  }
 
}
