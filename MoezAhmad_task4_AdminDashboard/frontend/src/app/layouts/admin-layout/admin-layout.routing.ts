import { Routes } from "@angular/router";

import { UserProfileComponent } from "../../user-profile/user-profile.component";
import { DashboardComponent } from "../../dashboard/dashboard.component";
export const AdminLayoutRoutes: Routes = [
  { path: "user-profile", component: UserProfileComponent },
  { path: "dashboard", component: DashboardComponent },
];
