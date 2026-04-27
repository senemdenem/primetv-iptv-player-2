import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'PrimeTV - IPTV Player',
      login: 'Login',
      m3uUrl: 'M3U URL',
      xtreamCodes: 'Xtream Codes',
      localFile: 'Local File',
      username: 'Username',
      password: 'Password',
      hostUrl: 'Host URL',
      playlistName: 'Playlist Name',
      connect: 'Connect',
      all: 'All Channels',
      favorites: 'Favorites',
      recent: 'Recent',
      search: 'Search channels...',
      noChannels: 'No channels found',
      settings: 'Settings',
      language: 'Language',
      parentalControl: 'Parental Control',
      setPin: 'Set PIN',
      enterPin: 'Enter PIN',
      invalidPin: 'Invalid PIN',
      nowPlaying: 'Now Playing',
      next: 'Next',
      guide: 'TV Guide',
      category: 'Category',
      back: 'Back',
      playing: 'Playing',
      errorLoading: 'Error loading stream',
      autoReconnect: 'Reconnecting...',
      buffering: 'Buffering...',
    }
  },
  tr: {
    translation: {
      appName: 'PrimeTV - IPTV Oynatıcı',
      login: 'Giriş',
      m3uUrl: 'M3U Bağlantısı',
      xtreamCodes: 'Xtream Kodları',
      localFile: 'Yerel Dosya',
      username: 'Kullanıcı Adı',
      password: 'Şifre',
      hostUrl: 'Sunucu Adresi',
      playlistName: 'Oynatma Listesi Adı',
      connect: 'Bağlan',
      all: 'Tüm Kanallar',
      favorites: 'Favoriler',
      recent: 'Son İzlenenler',
      search: 'Kanal ara...',
      noChannels: 'Kanal bulunamadı',
      settings: 'Ayarlar',
      language: 'Dil',
      parentalControl: 'Ebeveyn Kontrolü',
      setPin: 'PIN Oluştur',
      enterPin: 'PIN Girin',
      invalidPin: 'Geçersiz PIN',
      nowPlaying: 'Şu an',
      next: 'Sıradaki',
      guide: 'Yayın Akışı',
      category: 'Kategori',
      back: 'Geri',
      playing: 'Oynatılıyor',
      errorLoading: 'Yayın yüklenemedi',
      autoReconnect: 'Yeniden bağlanıyor...',
      buffering: 'Yükleniyor...',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr',
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
