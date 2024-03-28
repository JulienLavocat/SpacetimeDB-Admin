import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlComponent } from './sql.component';

describe('SqlComponent', () => {
  let component: SqlComponent;
  let fixture: ComponentFixture<SqlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SqlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SqlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
