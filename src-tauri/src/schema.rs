// @generated automatically by Diesel CLI.

diesel::table! {
    companies (id) {
        id -> Integer,
        name -> Text,
        nip -> Nullable<Text>,
        street -> Nullable<Text>,
        city -> Nullable<Text>,
        postal_code -> Nullable<Text>,
        country -> Nullable<Text>,
        created_at -> Timestamp,
        ksef_connected -> Bool,
        ksef_metadata -> Nullable<Text>,
    }
}
