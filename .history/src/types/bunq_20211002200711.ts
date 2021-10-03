export interface MonetaryAccount {
  MonetaryAccountBank: MonetaryAccountBank;
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
