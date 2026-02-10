import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Hero } from "../../components/hero/hero";
import { Footer } from "../../components/footer/footer";
import { BackToTop } from "../../components/back-to-top/back-to-top";
import { Profiles } from "../../components/profiles/profiles";
import { Drawer } from "../../../auth/components/drawer/drawer";
import { ThemeSwitcher } from "../../components/theme-switcher/theme-switcher";
import { FeaturedProjects } from "../../components/featured-projects/featured-projects";

@Component({
  selector: 'app-landing',
  imports: [Hero, Footer, BackToTop, Profiles, Drawer, FeaturedProjects],
  templateUrl: './landing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing { }
