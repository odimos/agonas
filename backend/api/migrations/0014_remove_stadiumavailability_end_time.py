from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_stadiumavailability'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='stadiumavailability',
            name='end_time',
        ),
    ]
