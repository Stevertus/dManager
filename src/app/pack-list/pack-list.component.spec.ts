import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PackListComponent } from './pack-list.component';

describe('PackListComponent', () => {
  let component: PackListComponent;
  let fixture: ComponentFixture<PackListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PackListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PackListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
