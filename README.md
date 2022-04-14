# Compress S3 bucket

This program takes a source bucket a destiny bucket and
copy all the images in the source bucket to the destiny bucket.

If the image is a PNG or other supported format, the image is going
to be transformed to JPG.

If the image is less than a 500kb it does not compress transformations.
If the image is larger than 500Kb the this compress the image using 30%
quality attribute.

Finally if the image is bigger than 1720 pixels width, then it is rescaled
preserving the aspect ratio.

This code should be deployed as AWS λ funciton and called using an
AWS batch operation. It takes several seconds to transform each image
so be sure to configure the timeout accordingly in the λ function.

The response is ready for batch operations expected JSON.

# 🦦
