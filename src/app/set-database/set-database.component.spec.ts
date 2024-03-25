import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetDatabaseComponent } from './set-database.component';

describe('SetDatabaseComponent', () => {
  let component: SetDatabaseComponent;
  let fixture: ComponentFixture<SetDatabaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetDatabaseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SetDatabaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
