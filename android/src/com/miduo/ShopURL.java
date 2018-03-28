package com.miduo;

import android.content.Intent;
import android.net.Uri;

import org.cocos2dx.lib.Cocos2dxActivity;

/**
 * Created by MrLizs on 2017/12/8.
 */

public class ShopURL {
    public static void openURL(String _url){
        Cocos2dxActivity active = (Cocos2dxActivity) Cocos2dxActivity.getContext();
        Uri uri = Uri.parse(_url);
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        active.startActivity(intent);
    }
}
