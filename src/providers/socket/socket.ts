// import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { LocalNotifications } from '@ionic-native/local-notifications';

@Injectable()
export class SocketProvider {

  constructor(private ln: LocalNotifications) {

  }

  localNotification(text) {
    this.ln.schedule({
      id: 1,
      text: text,
      sound: '../assets/beep-08b.mp3'
    });
  }

  private socket = io('http://192.168.0.3:2700');

  // constructor() { }

  emit(value, data)
  {
    this.socket.emit(value, data);
  }

  listen(value)
  {
    let observable = new Observable<any>((observer) => {
        this.socket.on(value, (data)=>{
            observer.next(data);
        });
    });
    return observable;
  }
}
