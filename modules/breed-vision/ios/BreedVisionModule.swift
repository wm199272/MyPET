import ExpoModulesCore
import UIKit
import Vision

public class BreedVisionModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BreedVision")

    AsyncFunction("classify") { (uri: String, promise: Promise) in
      guard let path = imagePath(uri), let image = UIImage(contentsOfFile: path), let cgImage = image.cgImage else {
        promise.resolve([])
        return
      }
      let request = VNClassifyImageRequest()
      let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
      DispatchQueue.global(qos: .userInitiated).async {
        do {
          try handler.perform([request])
          let rows = (request.results ?? [])
            .prefix(8)
            .compactMap { item -> [String: Any]? in
              guard let observation = item as? VNClassificationObservation else { return nil }
              return ["identifier": observation.identifier, "confidence": observation.confidence]
            }
          promise.resolve(rows)
        } catch {
          promise.resolve([])
        }
      }
    }
  }
}

private func imagePath(_ uri: String) -> String? {
  if let url = URL(string: uri), url.isFileURL {
    return url.path
  }
  if uri.hasPrefix("/") {
    return uri
  }
  return nil
}
