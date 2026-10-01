package com.redro.schoolplanner;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.util.Base64;
import java.io.OutputStream;

public class MainActivity extends Activity {
    private WebView web;
    private byte[] pendingPng;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        web.setWebViewClient(new WebViewClient());
        web.addJavascriptInterface(new Bridge(), "Android");
        web.loadUrl("file:///android_asset/index.html");
        setContentView(web);
    }

    private class Bridge {
        @JavascriptInterface
        public void printPage() {
            runOnUiThread(() -> {
                PrintManager pm = (PrintManager)getSystemService(PRINT_SERVICE);
                if (pm != null) {
                    pm.print("Redro School Planner",
                        web.createPrintDocumentAdapter("Redro School Planner"),
                        new PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build());
                }
            });
        }

        @JavascriptInterface
        public void savePng(String dataUrl, String suggestedName) {
            try {
                String base64 = dataUrl.substring(dataUrl.indexOf(",") + 1);
                pendingPng = Base64.decode(base64, Base64.DEFAULT);
                runOnUiThread(() -> {
                    Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("image/png");
                    i.putExtra(Intent.EXTRA_TITLE, suggestedName == null ? "redro-school-planner.png" : suggestedName);
                    startActivityForResult(i, 7001);
                });
            } catch (Exception e) {
                pendingPng = null;
            }
        }
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 7001 && resultCode == RESULT_OK && data != null && data.getData() != null && pendingPng != null) {
            try {
                ContentResolver cr = getContentResolver();
                try (OutputStream out = cr.openOutputStream(data.getData())) {
                    if (out != null) out.write(pendingPng);
                }
            } catch (Exception ignored) {
            } finally {
                pendingPng = null;
            }
        } else if (requestCode == 7001) {
            pendingPng = null;
        }
    }
}