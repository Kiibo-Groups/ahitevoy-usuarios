import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'list',
    loadChildren: () => import('./list/list.module').then(m => m.ListPageModule)
  },
  
  {
    path: 'welcome',
    loadChildren: () => import('./welcome/welcome.module').then(m => m.WelcomePageModule)
  },
  {
    path: 'city',
    loadChildren: () => import('./account/city/city.module').then(m => m.CityPageModule)
  },
  {
    path: 'item',
    loadChildren: () => import('./item/item.module').then(m => m.ItemPageModule)
  },
  {
    path: 'option',
    loadChildren: () => import('./option/option.module').then(m => m.OptionPageModule)
  },

  {
    path: 'info',
    loadChildren: () => import('./info/info.module').then(m => m.InfoPageModule)
  }, 
  {
    path: 'cart',
    loadChildren: () => import('./cart/cart.module').then(m => m.CartPageModule)
  }, 
  {
    path: 'offer',
    loadChildren: () => import('./offer/offer.module').then(m => m.OfferPageModule)
  }, 
  {
    path: 'login',
    loadChildren: () => import('./account/login/login.module').then(m => m.LoginPageModule)
  }, 
  {
    path: 'chkphone',
    loadChildren: () => import('./account/chkphone/chkphone.module').then(m => m.ChkphonePageModule)
  }, 

  {
    path: 'verfycode',
    loadChildren: () => import('./account/verfycode/verfycode.module').then(m => m.VerfycodePageModule)
  }, 
  {
    path: 'signup',
    loadChildren: () => import('./account/signup/signup.module').then(m => m.SignupPageModule)
  }, 
  {
    path: 'forgot',
    loadChildren: () => import('./account/forgot/forgot.module').then(m => m.ForgotPageModule)
  }, 
  {
    path: 'address',
    loadChildren: () => import('./account/address/address.module').then(m => m.AddressPageModule)
  }, 
  {
    path: 'done',
    loadChildren: () => import('./done/done.module').then(m => m.DonePageModule)
  }, 

  {
    path: 'profile',
    loadChildren: () => import('./account/profile/profile.module').then(m => m.ProfilePageModule)
  }, 
  {
    path: 'order',
    loadChildren: () => import('./account/order/order.module').then(m => m.OrderPageModule)
  }, 
  {
    path: 'rate/:id/:type',
    loadChildren: () => import('./account/rate/rate.module').then(m => m.RatePageModule)
  }, 
  {
    path: 'about',
    loadChildren: () => import('./page/about/about.module').then(m => m.AboutPageModule)
  }, 
  {
    path: 'how',
    loadChildren: () => import('./page/how/how.module').then(m => m.HowPageModule)
  }, 

  {
    path: 'faq',
    loadChildren: () => import('./page/faq/faq.module').then(m => m.FaqPageModule)
  }, 
  {
    path: 'contact',
    loadChildren: () => import('./page/contact/contact.module').then(m => m.ContactPageModule)
  }, 
  {
    path: 'lang',
    loadChildren: () => import('./lang/lang.module').then(m => m.LangPageModule)
  }, 
  {
    path: 'categorys',
    loadChildren: () => import('./categorys/categorys.module').then(m => m.CategorysPageModule)
  }, 
  {
    path: 'locked',
    loadChildren: () => import('./locked/locked.module').then(m => m.LockedPageModule)
  }, 
  {
    path: 'setaddress',
    loadChildren: () => import('./account/address/setaddress/setaddress.module').then( m => m.SetaddressPageModule)
  },
  {
    path: 'option-pay',
    loadChildren: () => import('./account/option-pay/option-pay.module').then( m => m.OptionPayPageModule)
  },
  {
    path: 'form-card',
    loadChildren: () => import('./account/form-card/form-card.module').then( m => m.FormCardPageModule)
  },
  {
    path: 'info-fee',
    loadChildren: () => import('./cart/info-fee/info-fee.module').then( m => m.InfoFeePageModule)
  },
  {
    path: 'waitpage',
    loadChildren: () => import('./waitpage/waitpage.module').then( m => m.WaitpagePageModule)
  },
  {
    path: 'filters',
    loadChildren: () => import('./filters/filters.module').then( m => m.FiltersPageModule)
  },
  {
    path: 'favorites',
    loadChildren: () => import('./account/favorites/favorites.module').then( m => m.FavoritesPageModule)
  },
  {
    path: 'rate-trip',
    loadChildren: () => import('./done/rate-trip/rate-trip.module').then( m => m.RateTripPageModule)
  },
  {
    path: 'verify-code',
    loadChildren: () => import('./account/login/verify-code/verify-code.module').then( m => m.VerifyCodePageModule)
  },
  {
    path: 'view-trip',
    loadChildren: () => import('./done/view-trip/view-trip.module').then( m => m.ViewTripPageModule)
  },
  {
    path: 'delete-account',
    loadChildren: () => import('./account/delete-account/delete-account.module').then( m => m.DeleteAccountPageModule)
  },
  {
    path: 'commanded',
    loadChildren: () => import('./commanded/commanded.module').then( m => m.CommandedPageModule)
  },
  {
    path: 'done-comm',
    loadChildren: () => import('./done-comm/done-comm.module').then( m => m.DoneCommPageModule)
  }
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
