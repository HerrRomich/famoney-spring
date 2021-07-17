import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServerEventsService {
  constructor(private _ngZone: NgZone) {}

  connectToServer<T>(url: string): Observable<T> {
    return new Observable<T>(subscriber => {
      const eventSource = new EventSource(url);
      eventSource.onmessage = event => {
        this._ngZone.run(() => {
          subscriber.next(JSON.parse(event.data));
        });
      };
      eventSource.onerror = error => {
        this._ngZone.run(() => {
          subscriber.error(error);
        });
      };
      setTimeout(() => {
        console.log(eventSource.readyState);
      }, 5000);
      return () => {
        eventSource.close();
      };
    });
  }
}
