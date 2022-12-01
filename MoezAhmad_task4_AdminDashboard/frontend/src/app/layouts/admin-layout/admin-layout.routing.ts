import { Routes } from "@angular/router";

import { UserProfileComponent } from "../../user-profile/user-profile.component";
import { DashboardComponent } from "../../dashboard/dashboard.component";
import { TypographyComponent } from "../../typography/typography.component";

export const AdminLayoutRoutes: Routes = [
  { path: "user-profile", component: UserProfileComponent },
  { path: "dashboard", component: DashboardComponent },
  { path: "typography", component: TypographyComponent },
];
