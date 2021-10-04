export interface MonetaryAccount {
  MonetaryAccountBank?: MonetaryAccountBank;
  MonetaryAccountSavings?: MonetaryAccountSavings;
  MonetaryAccountJoint?: MonetaryAccountJoint;
}

export interface MonetaryAccountBank {
  id:                       number;
  created:                  Date;
  updated:                  Date;
  alias:                    Alias[];
  avatar:                   Avatar;
  balance:                  Balance;
  country:                  string;
  currency:                 string;
  display_name:             string;
  daily_limit:              Balance;
  description:              string;
  public_uuid:              string;
  status:                   string;
  sub_status:               string;
  timezone:                 string;
  user_id:                  number;
  monetary_account_profile: MonetaryAccountProfile;
  setting:                  Setting;
  connected_cards:          any[];
  overdraft_limit:          Balance;
  all_auto_save_id:         any[];
  total_request_pending:    Balance;
}

export interface Alias {
  type:  string;
  value: string;
  name:  string;
}

export interface Avatar {
  uuid:        string;
  image:       Image[];
  anchor_uuid: string;
  style:       string;
}

export interface Image {
  attachment_public_uuid: string;
  height:                 number;
  width:                  number;
  content_type:           string;
}

export interface Balance {
  currency: string;
  value:    string;
}

export interface MonetaryAccountProfile {
  profile_fill:            null;
  profile_drain:           null;
  profile_action_required: string;
  profile_amount_required: Balance;
}

export interface Setting {
  color:                 string;
  icon:                  string;
  default_avatar_status: string;
  restriction_chat:      string;
  sdd_expiration_action: string;
}


export interface MonetaryAccountSavings {
  id:                       number;
  created:                  Date;
  updated:                  Date;
  alias:                    Alias[];
  avatar:                   Avatar;
  balance:                  Balance;
  country:                  string;
  currency:                 string;
  display_name:             string;
  daily_limit:              Balance;
  description:              string;
  public_uuid:              string;
  status:                   string;
  sub_status:               string;
  timezone:                 string;
  user_id:                  number;
  monetary_account_profile: null;
  setting:                  Setting;
  connected_cards:          any[];
  overdraft_limit:          Balance;
  savings_goal:             Balance;
  savings_goal_progress:    string;
  all_auto_save_id:         any[];
  total_request_pending:    Balance;
}

export interface Alias {
  type:  string;
  value: string;
  name:  string;
}

export interface Avatar {
  uuid:        string;
  image:       Image[];
  anchor_uuid: string;
  style:       string;
}

export interface Image {
  attachment_public_uuid: string;
  height:                 number;
  width:                  number;
  content_type:           string;
}

export interface Balance {
  currency: string;
  value:    string;
}

export interface Setting {
  color:                 string;
  icon:                  string;
  default_avatar_status: string;
  restriction_chat:      string;
  sdd_expiration_action: string;
}


export interface MonetaryAccountJoint {
  id:                       number;
  created:                  Date;
  updated:                  Date;
  alias:                    AliasElement[];
  avatar:                   Avatar;
  balance:                  Balance;
  country:                  string;
  currency:                 string;
  display_name:             string;
  daily_limit:              Balance;
  description:              string;
  public_uuid:              string;
  status:                   string;
  sub_status:               string;
  timezone:                 string;
  user_id:                  number;
  monetary_account_profile: MonetaryAccountProfile;
  setting:                  Setting;
  connected_cards:          any[];
  overdraft_limit:          Balance;
  all_co_owner:             AllCoOwner[];
  all_auto_save_id:         any[];
  total_request_pending:    Balance;
}

export interface AliasElement {
  type:  string;
  value: string;
  name:  string;
}

export interface AllCoOwner {
  alias:  AllCoOwnerAlias;
  status: string;
}

export interface AllCoOwnerAlias {
  uuid:             string;
  display_name:     string;
  country:          string;
  avatar:           Avatar;
  public_nick_name: string;
  type:             string;
}

export interface Avatar {
  uuid:        string;
  image:       Image[];
  anchor_uuid: string;
  style:       string;
}

export interface Image {
  attachment_public_uuid: string;
  height:                 number;
  width:                  number;
  content_type:           string;
}

export interface Balance {
  currency: string;
  value:    string;
}

export interface MonetaryAccountProfile {
  profile_fill:            null;
  profile_drain:           null;
  profile_action_required: string;
  profile_amount_required: Balance;
}

export interface Setting {
  color:                 string;
  icon:                  string;
  default_avatar_status: string;
  restriction_chat:      string;
  sdd_expiration_action: string;
}

export interface Payment {
  id:                               number;
  created:                          string;
  updated:                          string;
  monetary_account_id:              number;
  amount:                           Amount;
  description:                      string;
  type:                             string;
  merchant_reference:               null;
  alias:                            Alias;
  counterparty_alias:               Alias;
  attachment:                       any[];
  geolocation:                      null;
  batch_id:                         null;
  scheduled_id:                     null;
  address_billing:                  null;
  address_shipping:                 null;
  sub_type:                         string;
  request_reference_split_the_bill: any[];
  balance_after_mutation:           Amount;
  payment_auto_allocate_instance:   null;
}

export interface Alias {
  iban:         string;
  is_light:     boolean | null;
  display_name: string;
  avatar:       Avatar | null;
  label_user:   LabelUser;
  country:      string;
}

export interface Avatar {
  uuid:        string;
  image:       Image[];
  anchor_uuid: null | string;
  style:       string;
}

export interface Image {
  attachment_public_uuid: string;
  height:                 number;
  width:                  number;
  content_type:           string;
}

export interface LabelUser {
  uuid:             null | string;
  display_name:     string;
  country:          string;
  avatar:           Avatar | null;
  public_nick_name: string;
  type:             null | string;
}

export interface Amount {
  currency: string;
  value:    string;
}