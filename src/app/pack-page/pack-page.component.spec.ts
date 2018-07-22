import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PackPageComponent } from './pack-page.component';

describe('PackPageComponent', () => {
  let component: PackPageComponent;
  let fixture: ComponentFixture<PackPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PackPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PackPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
