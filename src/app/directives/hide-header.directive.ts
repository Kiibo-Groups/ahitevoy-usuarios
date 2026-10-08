import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  standalone: false,
  selector: '[hide-header]'
})
export class HideHeaderDirective {

  @Input('header') header: any;
  @Input('searchicon') searchicon: any;
  private lastY = 0;
  headerHeight: any;
  constructor(
    public element: ElementRef,
    private renderer: Renderer2,
    private domCtrl: DomController
  ) { }

  ngOnInit(): void {
    this.domCtrl.write(() => {
        let headerEl = this.header ? (this.header.el || this.header.nativeElement || this.header) : null;
        let searchEl = this.searchicon ? (this.searchicon.el || this.searchicon.nativeElement || this.searchicon) : null;
        
        if (headerEl) {
            this.renderer.setStyle(headerEl, 'transition','margin-top 180ms');
        }
        if (searchEl) {
            this.renderer.setStyle(searchEl, 'transition','margin-right 180ms');
        }
    });
    
  }

  @HostListener('ionScroll', ['$event']) onContentScroll($event: any) {
    this.headerHeight = $event.detail.scrollTop;
    let headerEl = this.header ? (this.header.el || this.header.nativeElement || this.header) : null;
    let searchEl = this.searchicon ? (this.searchicon.el || this.searchicon.nativeElement || this.searchicon) : null;
    
    if ($event.detail.scrollTop > 100) {
      if (searchEl) this.renderer.setStyle(searchEl,'margin-right','0');
      if (headerEl) this.renderer.setStyle(headerEl,'margin-top','-62px');
    }else {
      if (headerEl) this.renderer.setStyle(headerEl,'margin-top','0px');
      if (searchEl) this.renderer.setStyle(searchEl,'margin-right','-62px');
    }
  }

}
