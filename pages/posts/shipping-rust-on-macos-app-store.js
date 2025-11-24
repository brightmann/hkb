import Layout from "@/components/layout";
import Full from "@/components/posts/full";

export const post = {
  slug: "shipping-rust-on-macos-app-store",
  title: "How to ship Rust code on the macOS App Store",
  publishedAt: "2025-07-20T15:00:00",
  content: `For [my macOS app GalleryMagic](https://usegallerymagic.com), I had the need to do some image manipulation. Browsing for open-source packages both on [crates.io](https://crates.io) as well as on [swiftpackageindex.com](https://swiftpackageindex.com), I came across [photon-rs](https://crates.io/crates/photon-rs), claiming to be a "[...] high-performance Rust image processing library".

Low and behold, in only ~50 lines of code, I was able to implement a command line program to resize images. Deciding that this was a good enough fit to be used in the app, now came the time to figure out how to ship this Rust code on the macOS App Store.

### Rust makes it easy

What makes shipping Rust code on the macOS App Store somewhat easy, compared to other languages, is that Cargo and the Rust compile compile your program to a static binary out of the box. This means that you can just ship this binary as part of your app bundle and be done with it. So step 1 is literally as easy as running

    cargo build --release

and copying the resulting binary to your app bundle. If you drag the binary into Xcode, it will automatically add it to the "Copy Bundle Resources" build phase.

<div class="p-5 rounded-lg bg-indigo-200 border-2 border-indigo-400 hover:bg-indigo-100 hover:border-indigo-300 align-items-center">
  <a href="https://apps.apple.com/us/app/gallerymagic/id6744827234?mt=12&itscg=30200&itsct=apps_box_badge&mttnsubad=6744827234" class="flex no-underline" style="color: rgb(75, 85, 99); font-weight: normal !important">
    <img src="/gallerymagic-icon.png" class="rounded-lg w-24 h-24" style="margin: 0 !important;"/>
    <p class="pl-5 content-center" style="margin: 0px !important">
      Check out <strong>GalleryMagic</strong> yourself. Create beautiful galleries of your photos in seconds. It's a free download!
    </p>
  </a>
</div>

As for calling the binary, I ended up using [Command](https://swiftpackageindex.com/tuist/Command) to run the binary from Swift code. Pretty straightforward:

    guard let toolPath = Bundle.main.path(
        forResource: "image-manip-cli", ofType: nil
    ) else {
        fatalError("image manipulation tool not found")
    }
    let runner = CommandRunner()
    try await runner.run(arguments: [toolPath, "--input", sourceUrl.path, "--output", targetUrl.path])

### Code signing

Already thinking I was done and ready to submit the app to the App Store, I was in for a surprise. The App Store requires all code to be signed, and that includes the Rust binary. So I had to figure out how to sign the binary. There's a [couple](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/Procedures/Procedures.html) of [articles](https://developer.apple.com/documentation/xcode/creating-distribution-signed-code-for-the-mac) and [apple development documentation](https://developer.apple.com/documentation/xcode/embedding-a-helper-tool-in-a-sandboxed-app#Embed-an-externally-built-tool) on how to do this. For my use case, it boiled down to running the following command in the "Run Script" build phase of my Xcode project:

    codesign -s - -i com.fastapps.magicgallery.image-manip-cli -o runtime --entitlements ../image-manip-cli.entitlements -f image-manip-cli

The entitlements file is a simple file that contains the following:

    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
        <key>com.apple.security.app-sandbox</key>
        <true/>
        <key>com.apple.security.inherit</key>
        <true/>
    </dict>
    </plist>

This tells the code signing tool to sign the binary with the app sandbox enabled, which is required for the App Store, as
well as to inherit all capabilities from the main app target. With this in place, I was able to successfully sign the binary and submit the app to the App Store.

### Universal Binaries

Straight after that, since I have an M3 Mac, I had to solve also making this work on Intel Macs. Once more, Rust makes it easy, because the cross-compilation experience is great. The first two lines in the "Run Script" build phase of my Xcode project are obvious. Compile for both architectures, x86_64 and aarch64:

    cargo build --release --target=aarch64-apple-darwin
    cargo build --release --target=x86_64-apple-darwin

Up next is a line which squashes together the two binaries into a single universal binary. You can't really decide in your app itself at runtime which architecture the user's machine is running, you have to defer to the OS here. Using the lipo tool which comes as part of Xcode and is automatically available in the build environment:

    lipo -create -output \\
      target/universal/image-manip-cli \\
      target/x86_64-apple-darwin/release/image-manip-cli \\
      target/aarch64-apple-darwin/release/image-manip-cli

And just like that I was able to ship Rust code on the macOS App Store, supporting both architectures the Mac currently runs on and using codesigning/sandboxing to allow the app into the official Mac App Store.
`
};

export default function Post() {
  return (
    <Layout>
      <Full post={post} />
    </Layout>
  );
}

